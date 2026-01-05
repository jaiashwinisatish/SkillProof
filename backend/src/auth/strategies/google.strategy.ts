import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'your-google-client-id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'your-google-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails?.[0]?.value,
        firstName: name?.givenName,
        lastName: name?.familyName,
        avatar: photos?.[0]?.value,
        provider: 'google',
        providerId: profile.id,
      };

      const validatedUser = await this.authService.oauthLogin('google', {
        ...user,
        username: emails?.[0]?.value?.split('@')[0],
      });

      done(null, validatedUser);
    } catch (error) {
      done(error, null);
    }
  }
}
