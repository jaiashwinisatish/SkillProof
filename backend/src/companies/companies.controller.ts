import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get company profile' })
  @ApiResponse({ status: 200, description: 'Company profile retrieved successfully' })
  async getCompanyProfile(@Request() req) {
    return this.companiesService.getCompanyByUser(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update company profile' })
  @ApiResponse({ status: 200, description: 'Company profile updated successfully' })
  async updateCompanyProfile(@Request() req, @Body() updateData: any) {
    return this.companiesService.updateCompany(req.user.id, updateData);
  }
}
