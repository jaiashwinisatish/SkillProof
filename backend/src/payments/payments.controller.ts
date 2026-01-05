import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async createPayment(@Body() paymentData: any) {
    return this.paymentsService.createPayment(paymentData);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Get current user payments' })
  @ApiResponse({ status: 200, description: 'User payments retrieved successfully' })
  async getMyPayments(@Request() req) {
    return this.paymentsService.getPaymentsByUser(req.user.id);
  }
}
