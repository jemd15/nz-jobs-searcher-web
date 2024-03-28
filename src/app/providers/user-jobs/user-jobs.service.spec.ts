import { TestBed } from '@angular/core/testing';

import { UserJobsService } from './user-jobs.service';

describe('UserJobsService', () => {
  let service: UserJobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
