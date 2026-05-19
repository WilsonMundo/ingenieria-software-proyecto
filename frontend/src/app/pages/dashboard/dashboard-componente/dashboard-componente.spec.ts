import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponente } from './dashboard-componente';

describe('DashboardComponente', () => {
  let component: DashboardComponente;
  let fixture: ComponentFixture<DashboardComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
