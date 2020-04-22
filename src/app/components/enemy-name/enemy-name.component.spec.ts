import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyNameComponent } from './enemy-name.component';

describe('EnemyNameComponent', () => {
  let component: EnemyNameComponent;
  let fixture: ComponentFixture<EnemyNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnemyNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnemyNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
