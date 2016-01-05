/*global System */
System.config({
	transpiler: 'typescript',
	typescriptOptions: {
        emitDecoratorMetadata: true,
        noEmitOnError: false
    },
	meta: {
		'*.ts': {
			format: 'es6'
		}
	},
	defaultJSExtensions: true,
	packages: {
		'src': {
			defaultExtension: 'ts'
		}
	},
	map: {
		typescript: 'node_modules/typescript/lib/typescript',
		text: 'node_modules/system-text/text'
	}
});