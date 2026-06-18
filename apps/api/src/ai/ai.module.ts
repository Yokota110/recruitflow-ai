import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { IntelligenceEngine } from './intelligence.engine';
import { CopilotService } from './copilot/copilot.service';
import { SummaryEngine } from './copilot/summary.engine';
import { InterviewQuestionEngine } from './copilot/interview.engine';
import { CareerGapsEngine } from './copilot/career-gaps.engine';
import { ComparisonEngine } from './copilot/comparison.engine';
import { RecommendationEngine } from './copilot/recommendation.engine';
import { ResumeParserEngine } from './copilot/resume-parser.engine';
import { RecruitingInsightsEngine } from './copilot/recruiting-insights.engine';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
      },
    }),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    IntelligenceEngine,
    CopilotService,
    SummaryEngine,
    InterviewQuestionEngine,
    CareerGapsEngine,
    ComparisonEngine,
    RecommendationEngine,
    ResumeParserEngine,
    RecruitingInsightsEngine,
  ],
  exports: [AiService, CopilotService],
})
export class AiModule {}
