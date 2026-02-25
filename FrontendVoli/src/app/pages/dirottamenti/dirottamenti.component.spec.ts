import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirottamentiComponent } from './dirottamenti.component';

describe('DirottamentiComponent', () => {
  let component: DirottamentiComponent;
  let fixture: ComponentFixture<DirottamentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirottamentiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirottamentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
