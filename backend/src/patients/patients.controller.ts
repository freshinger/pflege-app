import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Patient } from './patient.entity';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() patientData: Partial<Patient>) {
    return this.patientsService.create(patientData);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.patientsService.search(search);
    }
    return this.patientsService.findAll();
  }

  @Get('statistics')
  getStatistics() {
    return this.patientsService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(this.patientsService.findById(id));
    return this.patientsService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Patient>) {
    return this.patientsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
