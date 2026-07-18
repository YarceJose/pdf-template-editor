import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFields } from './sidebar-fields';

describe('SidebarFields', () => {
  let component: SidebarFields;
  let fixture: ComponentFixture<SidebarFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFields]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarFields);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
