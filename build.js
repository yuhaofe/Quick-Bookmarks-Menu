import * as sass from 'sass-embedded'
import * as esbuild from 'esbuild'
import * as process from 'process'

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

        build.onLoad({ filter: /\.scss$/ }, async args => {
            const { css, loadedUrls } = await sass.compileAsync(args.path);

            return {
                contents: css.toString('utf-8'),
                loader: 'css',
                watchFiles: loadedUrls.map(url => url.pathname)
            }
        });
    }
};

/**
 * @type { esbuild.BuildOptions }
 */
const buildOptions = {
    entryPoints: { 
        popup: 'src/Popup.tsx', 
        service_worker: 'src/service_worker.ts',
        off_screen: 'src/off_screen.ts'
    },
    outdir: 'build',
    bundle: true,
    minify: true,
    keepNames: true,
    format: 'esm',
    target: 'chrome88', // above manifest v3
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    logLevel: 'info',
    plugins: [scssPlugin],

    // dev options
    sourcemap: dev ? 'inline' : false,

    // prod options
    metafile: prod
};

async function build() {
    const context = await esbuild.context(buildOptions);
    const result = await context.rebuild();
    if (result.metafile) {
        console.log(await esbuild.analyzeMetafile(result.metafile));
    }
    if (dev) {
        await context.watch();
    } else {
        context.dispose();
    }
}

build();
