import { Component, OnInit, inject, signal } from '@angular/core';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css',
})
export class TareasComponent implements OnInit {
  private readonly tareasService = inject(TareasService);
  tareas = signal<Tarea[]>([]);
  editandoId = signal<number | null>(null);
  error = signal<string>('');

  ngOnInit(): void {
    this.tareasService.listar().subscribe((tareas) => {
      this.tareas.set(tareas);
    });
  }

  crear(titulo: string) {
    this.tareasService.crear(titulo).subscribe((tarea) => {
      this.tareas.update((tareas) => [...tareas, tarea]);
    });
  }

  editar(id: number) {
    this.error.set('');
    this.editandoId.set(id);
  }

  cancelar() {
    this.editandoId.set(null);
  }

  guardar(id: number, titulo: string) {
    this.tareasService.actualizar(id, titulo).subscribe({
      next: (actualizada) => {
        this.tareas.update((tareas) =>
          tareas.map((t) => (t.id === id ? actualizada : t)),
        );
        this.editandoId.set(null);
        this.error.set('');
      },
      error: () => this.error.set('No se pudo guardar la tarea. Puede que ya no exista.'),
    });
  }

  eliminar(id: number) {
    this.tareasService.eliminar(id).subscribe({
      next: () => {
        this.tareas.update((tareas) => tareas.filter((t) => t.id !== id));
        this.error.set('');
      },
      error: () => this.error.set('No se pudo eliminar la tarea. Puede que ya no exista.'),
    });
  }
}
