import { 
  Controller, 
  Get, 
  Post, 
  HttpCode, 
  HttpStatus,
  ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkillAnalysisService } from './core/skill-analysis.service';

@ApiTags('skill-analysis')
@Controller('skill-analysis')
export class SkillAnalysisController {
  constructor(private readonly skillAnalysisService: SkillAnalysisService) {}

  @Get()
  @ApiOperation({ summary: 'Get user skill analysis' })
  @ApiResponse({ status: 200, description: 'Skill analysis retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No evidence available' })
  async getSkillAnalysis() {
    try {
      const analysis = await this.skillAnalysisService.analyzeUserSkills('demo-user'); // Hardcoded for now

      return {
        statusCode: HttpStatus.OK,
        message: 'Skill analysis retrieved successfully',
        data: analysis
      };
    } catch (error) {
      return {
        statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Analysis failed',
        data: null
      };
    }
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Trigger skill analysis' })
  @ApiResponse({ status: 200, description: 'Skill analysis completed successfully' })
  @ApiResponse({ status: 400, description: 'Analysis failed' })
  async triggerAnalysis() {
    try {
      const analysis = await this.skillAnalysisService.analyzeUserSkills('demo-user', true); // Hardcoded for now

      return {
        statusCode: HttpStatus.OK,
        message: 'Skill analysis completed successfully',
        data: analysis
      };
    } catch (error) {
      return {
        statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Analysis failed',
        data: null
      };
    }
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get user skills list' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  async getSkillsList() {
    try {
      const skills = await this.skillAnalysisService.getUserSkills('demo-user'); // Hardcoded for now

      return {
        statusCode: HttpStatus.OK,
        message: 'Skills retrieved successfully',
        data: skills
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve skills',
        data: null
      };
    }
  }

  @Get('evidence')
  @ApiOperation({ summary: 'Get user evidence' })
  @ApiResponse({ status: 200, description: 'Evidence retrieved successfully' })
  async getEvidence() {
    try {
      const evidence = await this.skillAnalysisService.getUserEvidence('demo-user'); // Hardcoded for now

      return {
        statusCode: HttpStatus.OK,
        message: 'Evidence retrieved successfully',
        data: evidence
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve evidence',
        data: null
      };
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get analysis metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    try {
      const metrics = await this.skillAnalysisService.getAnalysisMetrics('demo-user'); // Hardcoded for now

      return {
        statusCode: HttpStatus.OK,
        message: 'Metrics retrieved successfully',
        data: metrics
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve metrics',
        data: null
      };
    }
  }
}
