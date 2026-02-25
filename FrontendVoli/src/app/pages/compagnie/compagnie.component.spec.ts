import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompagnieComponent } from './compagnie.component';

describe('CompagnieComponent', () => {
  let component: CompagnieComponent;
  let fixture: ComponentFixture<CompagnieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompagnieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompagnieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
