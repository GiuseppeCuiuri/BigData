import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RitardiComponent } from './ritardi.component';

describe('RitardiComponent', () => {
  let component: RitardiComponent;
  let fixture: ComponentFixture<RitardiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RitardiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RitardiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
