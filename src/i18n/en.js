export default {
	hello: 'hello',
	create_new_file: 'Create a new File',
	add_new_file: 'Add a new file',
	save_new_file: 'Save a new file',
	no_files: 'Empty Folder',
	import_files: 'Import files',
	how_to: 'How to',
	execute_code: 'Execute code',
	folders: 'folders',
	code: 'Code',
	files: 'Files',
	new_file: 'New File',
	new_file_tutorial: (render) =>
		render([
			'To create a new file, open the sidebar and click on the option "New File ',
			'"'
		]),
	run_code_tutorial: (render) =>
		render([
			'To execute the code, in the Code view, see the options in the upper right menu',
			' and press "Run"'
		]),
	save_file_tutorial: (render) =>
		render([
			'To save a file, in the Code view, see the options in the upper right menu ',
			' and press "Save"'
		]),
	settings: 'Settings',
	help: 'Help',
	about: 'About',
	import_files_disclaimer: 'this action will execute all files as one.',
	run: 'Run',
  console: 'Console',
  save: 'Save',
  save_all: 'Save All',
  saved_files: 'Saved Files',
  long_press_to_remove: 'Long press to remove',
  remove_alert_title: 'Delete {{fname}}',
  remove_alert_delete: 'DELETE',
  remove_alert_cancel: 'CANCEL',
  remove_alert_body: 'Are you sure ?',
  remove_alert_body_folder:
  	'Are you sure ? "{{filename}}" is a directory, and this action will remove every file and folder inside.',
  remove_alert_delete_error: "Error on remove {{fname}}",
	remove_alert_creating_error: "Error creating {{foldername}}",
	remove_alert_opening_error: "Error on open {{fname}}",
	remove_alert_deleted: '{{fname}} was removed.',
	folder_prompt_title: 'New Folder:',
	file_prompt_title: 'Save As:',
  language: 'Language',
  es: 'Spanish',
  en: 'English',
  preview: 'Preview',
  select_your_theme: 'Select your favorite theme',
  created_by: 'Created By'
}