import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldItem } from './field-item';

describe('FieldItem', () => {
  let component: FieldItem;
  let fixture: ComponentFixture<FieldItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
