import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvidoContraseniaComponente } from './olvido-contrasenia-componente';

describe('OlvidoContraseniaComponente', () => {
  let component: OlvidoContraseniaComponente;
  let fixture: ComponentFixture<OlvidoContraseniaComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OlvidoContraseniaComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OlvidoContraseniaComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
