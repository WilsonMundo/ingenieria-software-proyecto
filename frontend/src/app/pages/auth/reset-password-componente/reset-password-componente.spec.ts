import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponente } from './reset-password-componente';

describe('ResetPasswordComponente', () => {
  let component: ResetPasswordComponente;
  let fixture: ComponentFixture<ResetPasswordComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
