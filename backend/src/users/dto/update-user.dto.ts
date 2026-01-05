import { IsString, IsOptional, IsEmail, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User bio' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Student profile data' })
  @IsOptional()
  profile?: {
    university?: string;
    degree?: string;
    major?: string;
    graduationYear?: number;
    experience?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    resume?: string;
    isPublic?: boolean;
    allowRecruiters?: boolean;
    githubUrl?: string;
  };

  @ApiPropertyOptional({ description: 'Company profile data' })
  @IsOptional()
  company?: {
    name?: string;
    description?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    logo?: string;
  };
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  newPassword: string;
}
