import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooldetailComponent } from './tooldetail.component';

describe('TooldetailComponent', () => {
  let component: TooldetailComponent;
  let fixture: ComponentFixture<TooldetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooldetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooldetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
