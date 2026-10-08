import { Module } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InvestmentPlanSubService } from './sub-services/investment-plan.sub-service';
import { InvestmentExecutionSubService } from './sub-services/investment-execution.sub-service';

@Module({
  imports: [PrismaModule],
  controllers: [InvestmentsController],
  providers: [
    InvestmentPlanSubService,
    InvestmentExecutionSubService,
    InvestmentsService,
  ],
  exports: [
    InvestmentPlanSubService,
    InvestmentExecutionSubService,
    InvestmentsService,
  ],
})
export class InvestmentsModule {}
