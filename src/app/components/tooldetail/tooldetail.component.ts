import { Component, input, inject, computed } from '@angular/core';
import { map } from 'rxjs/operators';
import { toolshedService } from '../../services/toolshed-service.service';

@Component({
  selector: 'app-tooldetail',
  imports: [],
  templateUrl: './tooldetail.component.html',
  styleUrl: './tooldetail.component.css'
})
export class TooldetailComponent {
  id = input<string>('');
  toolshedService = inject(toolshedService);
  currProd$ = this.toolshedService.tools$.pipe(
    map((tools) => tools.find((p) => p.id === this.id()))
  );
}
