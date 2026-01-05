import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkillsService } from './skills.service';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  async getAllSkills() {
    return this.skillsService.getAllSkills();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get skills by category' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  async getSkillsByCategory(@Param('category') category: string) {
    return this.skillsService.getSkillsByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill by ID' })
  @ApiResponse({ status: 200, description: 'Skill retrieved successfully' })
  async getSkill(@Param('id') id: string) {
    return this.skillsService.getSkill(id);
  }
}
