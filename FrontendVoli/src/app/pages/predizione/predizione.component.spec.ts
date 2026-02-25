import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredizioneComponent } from './predizione.component';

describe('PredizioneComponent', () => {
  let component: PredizioneComponent;
  let fixture: ComponentFixture<PredizioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredizioneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredizioneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
