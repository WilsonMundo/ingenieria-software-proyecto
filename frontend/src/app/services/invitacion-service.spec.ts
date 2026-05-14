import { TestBed } from '@angular/core/testing';

import { Invitacion } from './invitacion';

describe('Invitacion', () => {
  let service: Invitacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Invitacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
