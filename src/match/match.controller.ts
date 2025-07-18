import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { MatchService } from './match.service';
import { Match, MatchStatus } from './match.entity';
import { Pet } from '../pets/pets.entity';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // Get all pets available for breeding
  @Get('available-pets')
  async findAvailablePets(
    @Query('username') username: string,
    @Query('petId') petId?: string
  ): Promise<Pet[]> {
    return this.matchService.findAvailablePetsByUsername(username, petId);
  }

  // Send a match request (frontend only sends pet IDs)
  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async createMatchRequest(
    @Body() requestData: { 
      requesterPetId: string, 
      recipientPetId: string,
      message?: string 
    }
  ): Promise<Match> {
    return this.matchService.createMatchRequestByPetIds(
      requestData.requesterPetId,
      requestData.recipientPetId,
      requestData.message
    );
  }

  // Get match requests sent by a user
  @Get('sent/:username')
  async getSentRequests(
    @Param('username') username: string
  ): Promise<Match[]> {
    return this.matchService.getSentRequestsByUsername(username);
  }

  // Get match requests received by a user
  @Get('received/:username')
  async getReceivedRequests(
    @Param('username') username: string,
    @Query('status') status?: string
  ): Promise<Match[]> {
    if (status === 'pending') {
      return this.matchService.getPendingReceivedRequestsByUsername(username);
    }
    return this.matchService.getReceivedRequestsByUsername(username);
  }

  // Respond to a match request
  @Post(':matchId/respond')
  async respondToMatchRequest(
    @Param('matchId') matchId: string,
    @Body() responseData: { username: string, approve: boolean }
  ): Promise<Match> {
    return this.matchService.respondToMatchRequestByUsername(
      matchId,
      responseData.approve
    );
  }

  // Get specific match details
  @Get(':matchId')
  async getMatchById(
    @Param('matchId') matchId: string,
    @Query('username') username: string
  ): Promise<Match> {
    if (!username) {
      throw new BadRequestException('username query parameter is required');
    }
    return this.matchService.getMatchByIdAndUsername(matchId, username);
  }

  // Get all pets available for breeding by username (alternative endpoint)
  @Get('available-pets/by-username')
  async findAvailablePetsByUsername(
    @Query('username') username: string,
    @Query('petId') petId?: string
  ): Promise<Pet[]> {
    if (!username) {
      throw new BadRequestException('username query parameter is required');
    }
    return this.matchService.findAvailablePetsByUsername(username, petId);
  }

  // Send a match request using usernames
  @Post('request/by-username')
  @HttpCode(HttpStatus.CREATED)
  async createMatchRequestByUsername(
    @Body() requestData: { 
      requesterUsername: string,
      requesterPetId: string, 
      recipientUsername: string, 
      recipientPetId: string,
      message?: string 
    }
  ): Promise<Match> {
    return this.matchService.createMatchRequestByUsername(
      requestData.requesterUsername,
      requestData.requesterPetId,
      requestData.recipientUsername,
      requestData.recipientPetId,
      requestData.message
    );
  }

  // Get match requests sent by username
  @Get('sent/by-username/:username')
  async getSentRequestsByUsername(
    @Param('username') username: string
  ): Promise<Match[]> {
    return this.matchService.getSentRequestsByUsername(username);
  }

  // Get match requests received by username
  @Get('received/by-username/:username')
  async getReceivedRequestsByUsername(
    @Param('username') username: string,
    @Query('status') status?: string
  ): Promise<Match[]> {
    if (status === 'pending') {
      return this.matchService.getPendingReceivedRequestsByUsername(username);
    }
    return this.matchService.getReceivedRequestsByUsername(username);
  }

  // Get approved matches for a username
  @Get('approved/by-username/:username')
  async getApprovedMatchesByUsername(
    @Param('username') username: string
  ): Promise<Match[]> {
    return this.matchService.getApprovedMatchesByUsername(username);
  }

  // Respond to a match request by username
  @Post(':matchId/respond/by-username')
  async respondToMatchRequestByUsername(
    @Param('matchId') matchId: string,
    @Body() responseData: { username: string, approve: boolean }
  ): Promise<Match> {
    return this.matchService.respondToMatchRequestByUsername(
      matchId,
      responseData.approve
    );
  }

  // Get specific match details by username
  @Get(':matchId/by-username')
  async getMatchByIdAndUsername(
    @Param('matchId') matchId: string,
    @Query('username') username: string
  ): Promise<Match> {
    if (!username) {
      throw new BadRequestException('username query parameter is required');
    }
    return this.matchService.getMatchByIdAndUsername(matchId, username);
  }
}
