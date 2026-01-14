import { Module } from '@nestjs/common';
import { SkillAnalysisController } from './skill-analysis.controller';
import { SkillAnalysisService } from './core/skill-analysis.service';

@Module({
  controllers: [SkillAnalysisController],
  providers: [SkillAnalysisService],
  exports: [SkillAnalysisService],
})
export class SkillAnalysisModule {}
