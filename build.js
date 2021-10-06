const sass = require('sass');
const esbuild = require('esbuild');
const process = require('process');

/**
 * @type { esbuild.Plugin }
 */
const scssPlugin = {
    name: 'scss',
    setup(build) {
        build.onLoad({ filter: /\.scss$/ }, args => {
            const { css, stats: { includedFiles }} = sass.renderSync({ file: args.path });

            return {
                contents: css.toString('utf-8'),
                loader: 'css',
                watchFiles: includedFiles
            }
        });
    }
};

/**
 * @type { esbuild.BuildOptions }
 */
const buildOptions = {
    entryPoints: ['src/qbm.jsx', 'src/background.js'],
    outdir: 'build',
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'chrome86',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    logLevel: 'info',
    plugins: [scssPlugin]
};

if (process.env.NODE_ENV === 'development') {
    buildOptions.sourcemap = 'inline';
    buildOptions.watch = true;
}

esbuild.build(buildOptions).catch(() => process.exit(1));