import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaVoliComponent } from './ricerca-voli.component';

describe('RicercaVoliComponent', () => {
  let component: RicercaVoliComponent;
  let fixture: ComponentFixture<RicercaVoliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RicercaVoliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RicercaVoliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
