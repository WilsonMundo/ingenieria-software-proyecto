import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnviarInvitacionComponente } from './enviar-invitacion-componente';

describe('EnviarInvitacionComponente', () => {
  let component: EnviarInvitacionComponente;
  let fixture: ComponentFixture<EnviarInvitacionComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnviarInvitacionComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnviarInvitacionComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
