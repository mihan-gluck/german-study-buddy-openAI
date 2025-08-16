import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignElevenlabsDialogComponent } from './assign-elevenlabs-dialog.component';

describe('AssignElevenlabsDialogComponent', () => {
  let component: AssignElevenlabsDialogComponent;
  let fixture: ComponentFixture<AssignElevenlabsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignElevenlabsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignElevenlabsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
