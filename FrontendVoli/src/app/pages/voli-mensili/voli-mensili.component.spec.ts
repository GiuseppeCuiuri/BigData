import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoliMensiliComponent } from './voli-mensili.component';

describe('VoliMensiliComponent', () => {
  let component: VoliMensiliComponent;
  let fixture: ComponentFixture<VoliMensiliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoliMensiliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoliMensiliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
