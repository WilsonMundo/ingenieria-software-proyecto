import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { InvitacionService } from './invitacion-service';

describe('InvitacionService', () => {
  let service: InvitacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(InvitacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
