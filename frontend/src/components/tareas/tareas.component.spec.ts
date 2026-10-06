import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Tarea } from './tarea.model';
import { TareasComponent } from './tareas.component';
import { TareasService } from './tareas.service';

describe('TareasComponent', () => {
  let fixture: ComponentFixture<TareasComponent>;
  let tareasService: jasmine.SpyObj<TareasService>;

  const iniciales: Tarea[] = [
    { id: 1, titulo: 'Leer la guía de la clase 2' },
  ];

  beforeEach(async () => {
    tareasService = jasmine.createSpyObj('TareasService', [
      'listar',
      'crear',
      'actualizar',
      'eliminar',
    ]);
    tareasService.listar.and.returnValue(of(iniciales));

    await TestBed.configureTestingModule({
      imports: [TareasComponent],
      providers: [{ provide: TareasService, useValue: tareasService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
  });

  it('muestra el id y el título de cada tarea', () => {
    const elemento: HTMLElement = fixture.nativeElement;

    expect(elemento.querySelector('.numero')?.textContent).toContain('1');
    expect(elemento.querySelector('.titulo')?.textContent).toContain(
      'Leer la guía de la clase 2',
    );
    expect(tareasService.listar).toHaveBeenCalled();
  });

  it('agrega la tarea creada al hacer clic en Agregar', () => {
    tareasService.crear.and.returnValue(
      of({ id: 2, titulo: 'Preparar el entorno' }),
    );

    const elemento: HTMLElement = fixture.nativeElement;
    const input = elemento.querySelector('input');
    expect(input).not.toBeNull();
    input!.value = 'Preparar el entorno';
    elemento.querySelector('button')!.click();
    fixture.detectChanges();

    expect(tareasService.crear).toHaveBeenCalledWith('Preparar el entorno');
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual([
      'Leer la guía de la clase 2',
      'Preparar el entorno',
    ]);
  });

  describe('editar y eliminar', () => {
    const dos: Tarea[] = [
      { id: 1, titulo: 'Leer la guía de la clase 2' },
      { id: 2, titulo: 'Preparar el entorno' },
    ];

    const boton = (raiz: ParentNode, texto: string) =>
      Array.from(raiz.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === texto,
      )!;

    const titulos = (elemento: HTMLElement) =>
      Array.from(elemento.querySelectorAll('.titulo')).map(
        (nodo) => nodo.textContent,
      );

    beforeEach(() => {
      fixture.componentInstance.tareas.set(dos);
      fixture.detectChanges();
    });

    it('edita el título de una tarea al pulsar Editar y Guardar', () => {
      tareasService.actualizar.and.returnValue(
        of({ id: 1, titulo: 'Título editado' }),
      );
      const elemento: HTMLElement = fixture.nativeElement;

      boton(elemento.querySelectorAll('li')[0], 'Editar').click();
      fixture.detectChanges();

      const li = elemento.querySelectorAll('li')[0];
      const campo = li.querySelector('input') as HTMLInputElement;
      campo.value = 'Título editado';
      boton(li, 'Guardar').click();
      fixture.detectChanges();

      expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Título editado');
      expect(titulos(elemento)).toEqual([
        'Título editado',
        'Preparar el entorno',
      ]);
    });

    it('elimina una tarea al pulsar Eliminar y deja las demás', () => {
      tareasService.eliminar.and.returnValue(of(dos[0]));
      const elemento: HTMLElement = fixture.nativeElement;

      boton(elemento.querySelectorAll('li')[0], 'Eliminar').click();
      fixture.detectChanges();

      expect(tareasService.eliminar).toHaveBeenCalledWith(1);
      expect(titulos(elemento)).toEqual(['Preparar el entorno']);
    });

    it('no cambia la lista y muestra un error si el backend responde 404', () => {
      tareasService.eliminar.and.returnValue(
        throwError(() => new Error('404')),
      );
      const elemento: HTMLElement = fixture.nativeElement;

      boton(elemento.querySelectorAll('li')[0], 'Eliminar').click();
      fixture.detectChanges();

      expect(titulos(elemento)).toEqual([
        'Leer la guía de la clase 2',
        'Preparar el entorno',
      ]);
      expect(elemento.querySelector('.error')?.textContent).toContain(
        'No se pudo eliminar',
      );
    });
  });
});
