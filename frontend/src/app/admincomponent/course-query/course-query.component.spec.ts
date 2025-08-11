import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseQueryComponent } from './course-query.component';

describe('CourseQueryComponent', () => {
  let component: CourseQueryComponent;
  let fixture: ComponentFixture<CourseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourseQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
