import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-event',
  templateUrl: './delete-event.component.html',
  styleUrls: ['./delete-event.component.css']
})
export class DeleteEventComponent {
  // TODO: Create separate package for unrelated(?) components
  @Input() day;
  @Input() start;
  @Input() end;

  constructor(public activeModal: NgbActiveModal) {}

}
