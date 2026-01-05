import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'your-github-client-id',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || 'your-github-client-secret',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3001/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    try {
      const { username, displayName, emails, photos } = profile;
      const user = {
        username,
        displayName,
        email: emails?.[0]?.value,
        avatar: photos?.[0]?.value,
        provider: 'github',
        providerId: profile.id,
      };

      const validatedUser = await this.authService.oauthLogin('github', {
        ...user,
        firstName: displayName?.split(' ')[0] || username,
        lastName: displayName?.split(' ')[1] || '',
        githubUsername: username,
      });

      done(null, validatedUser);
    } catch (error) {
      done(error, null);
    }
  }
}
