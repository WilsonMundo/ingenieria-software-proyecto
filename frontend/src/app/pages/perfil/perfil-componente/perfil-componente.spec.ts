import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilComponente } from './perfil-componente';

describe('PerfilComponente', () => {
  let component: PerfilComponente;
  let fixture: ComponentFixture<PerfilComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
