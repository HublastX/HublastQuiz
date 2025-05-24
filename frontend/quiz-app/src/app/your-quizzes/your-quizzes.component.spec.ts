import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourQuizzesComponent } from './your-quizzes.component';

describe('YourQuizzesComponent', () => {
  let component: YourQuizzesComponent;
  let fixture: ComponentFixture<YourQuizzesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YourQuizzesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YourQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
