const sass = require('sass');
const esbuild = require('esbuild');
const process = require('process');

const dev = process.env.NODE_ENV === 'development';
const prod = process.env.NODE_ENV === 'production';

/**
 * @type { esbuild.Plugin }
 */
const scssPlugin = {
    name: 'scss',
    setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
            // do not resolve css url()
            if (args.kind === 'url-token') {
                return { external: true };
            }
        });

        build.onLoad({ filter: /\.scss$/ }, args => {
            const { css, stats: { includedFiles } } = sass.renderSync({ file: args.path });

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
    entryPoints: { popup: 'src/Popup.tsx', background: 'src/background.ts' },
    outdir: 'build',
    bundle: true,
    minify: true,
    keepNames: true,
    format: 'esm',
    target: 'chrome86',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    logLevel: 'info',
    plugins: [scssPlugin],

    // dev options
    sourcemap: dev ? 'inline' : false,
    watch: dev,

    // prod options
    metafile: prod
};

async function build() {
    const result = await esbuild.build(buildOptions).catch(() => process.exit(1));

    if (result.metafile) {
        console.log(await esbuild.analyzeMetafile(result.metafile));
    }
}

build();
