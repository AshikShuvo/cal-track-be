import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { NutritionReportDto } from './dto/nutrition-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('food-logs')
  @ApiOperation({ summary: 'Create a new food log entry' })
  @ApiResponse({ status: 201, description: 'Food log created successfully' })
  createFoodLog(
    @CurrentUser() user: User,
    @Body() createFoodLogDto: CreateFoodLogDto
  ) {
    return this.nutritionService.createFoodLog(user.id, createFoodLogDto);
  }

  @Patch('food-logs/:id')
  @ApiOperation({ summary: 'Update a food log entry' })
  @ApiResponse({ status: 200, description: 'Food log updated successfully' })
  updateFoodLog(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateFoodLogDto: UpdateFoodLogDto
  ) {
    return this.nutritionService.updateFoodLog(user.id, id, updateFoodLogDto);
  }

  @Delete('food-logs/:id')
  @ApiOperation({ summary: 'Delete a food log entry' })
  @ApiResponse({ status: 200, description: 'Food log deleted successfully' })
  deleteFoodLog(
    @CurrentUser() user: User,
    @Param('id') id: string
  ) {
    return this.nutritionService.deleteFoodLog(user.id, id);
  }

  @Get('reports/daily')
  @ApiOperation({ summary: 'Get daily nutrition report' })
  @ApiResponse({ status: 200, description: 'Returns daily nutrition report', type: NutritionReportDto })
  getDailyReport(
    @CurrentUser() user: User,
    @Query('date') date: string
  ): Promise<NutritionReportDto> {
    return this.nutritionService.getDailyReport(user.id, new Date(date));
  }

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Get monthly nutrition report' })
  @ApiResponse({ status: 200, description: 'Returns monthly nutrition report', type: NutritionReportDto })
  getMonthlyReport(
    @CurrentUser() user: User,
    @Query('year') year: number,
    @Query('month') month: number
  ): Promise<NutritionReportDto> {
    return this.nutritionService.getMonthlyReport(user.id, year, month);
  }
} 