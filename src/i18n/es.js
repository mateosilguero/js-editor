export default {
	hello: 'hola',
	create_new_file: 'Crear un nuevo archivo',
	add_new_file: 'Agregar un nuevo archivo',
	save_new_file: 'Guardar un nuevo archivo',
	no_files: 'Carpeta vacía',
	import_files: 'Importar archivos',
	how_to: '¿Cómo',
	execute_code: 'Ejecutar código',
	folders: 'carpetas',
	code: 'Código',
	files: 'Archivos',
	new_file: 'Nuevo Archivo',
	new_file_tutorial: (render) =>
		render(['Para crear un nuevo archivo, abre la barra lateral y presiona en la opción "Nuevo Archivo ', '"']),
	run_code_tutorial: (render) =>
		render([
			'Para ejecutar el código, en la vista de Código, ver la opciones en el menú superior derecho ',
			' y presionar la opcion "Ejecutar"'
		]),
	save_file_tutorial: (render) =>
		render([
			'Para guardar un archivo, en la vista de Código, ver la opciones en el menú superior derecho ',
			' y presionar la opción "Guardar"'
		]),
	settings: 'Ajustes',
	help: 'Ayuda',
	about: 'Información',
	import_files_disclaimer: 'Esta acción ejecutará los archivos como uno solo.',
	run: 'Ejecutar',
  console: 'Consola',
  share: 'Compartir',
  save: 'Guardar',
  save_all: 'Guardar Todo',
  saved_files: 'Archivos',
  long_press_to_remove: 'Mantener presionado para borrar',
  remove_alert_title: 'Se eliminará {{fname}}',
  remove_alert_delete: 'ELIMINAR',
  remove_alert_cancel: 'CANCELAR',
  remove_alert_body: 'Deseas continuar ?',
  remove_alert_body_folder:
  	'Deseas continuar ? "{{filename}}" es una carpeta, y esta acción removerá el directorio y todo su contenido.',
  remove_alert_delete_error: "Error al eliminar {{fname}}",
	remove_alert_creating_error: "Error al crear {{foldername}}",
	remove_alert_opening_error: "Error al abrir {{fname}}",
	remove_alert_deleted: 'Se eliminó {{fname}}.',
	folder_prompt_title: 'Nueva Carpeta:',
	file_prompt_title: 'Guardar Como:',
  language: 'Idioma',
  es: 'Español',
  en: 'Inglés',
  preview: 'Vista Previa',
  select_your_theme: 'Elige tu tema favorito',
  created_by: 'Creado Por'
}