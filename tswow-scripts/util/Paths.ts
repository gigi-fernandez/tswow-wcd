/*
 * This file is part of tswow (https://github.com/tswow)
 *
 * Copyright (C) 2020 tswow <https://github.com/tswow/>
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import * as fs from 'fs';
import path from 'path';
import { mpath, wfs } from './FileSystem';
import { custom, dir, dirn, dynCustom, dyndir, dynfile, enumDir, file, generateTree, WDirectory, WFile } from "./FileTree";
import { isWindows } from './Platform';

export const TDB_URL = "https://github.com/TrinityCore/TrinityCore/releases/download/TDB335.21091/TDB_full_world_335.21091_2021_09_28.7z"

export const DATASET_MODULES_CONFIG = 'Dataset.Modules'
export const DATASET_CLIENT_PATCH_LETTER = 'Client.Patch.Letter'

export function tdbFilename() {
    let split = TDB_URL.split('/')
    let joined = split[split.length-1];
    return joined.substring(0,joined.length-3)+'.sql';
}

export function DatasetDirectory(inPath: string, inName: string) {
    return generateTree(path.join(inPath,inName),dir({
        Buildings: dir({}),
        Cameras: dir({}),
        Crashes: dir({}),
        dbc: dir({}),
        dbc_source: dir({}),
        dbc_temp: dir({
            dbc: dir({}),
        }),
        luaxml: dir({
            Interface: dir({
                FrameXML: dir({
                    framexml_toc: file('FrameXML.toc'),
                    TSAddons: dir({
                        mod: dyndir(()=>({}))
                    })
                })
            })
        }),
        luaxml_source: dir({}),
        maps: dir({}),
        mmaps: dir({}),
        vmaps: dir({}),
        config: file(`${inName}.dataset.conf`),
        ids_txt: file('ids.txt')
    }))
}

export function RealmDirectory(inPath: string, inName: string) {
    return generateTree(path.join(inPath,inName),dir({
        worldserver_conf: file('worldserver.conf'),
        worldserver_conf_dist: file('worldserver.conf.dist'),
        config: file(`${inName}.realm.conf`),
        realm_id: file(`realm.id`),
        core_config: dynfile(type=>{
            type = type.replace('.conf.dist','.conf')
            if(!type.endsWith('.conf')) type = type+'.conf'
            return type;
        }),
    }))
}

export function DatascriptsDirectory(inPath: string) {
    return generateTree(inPath,dir({
        global_d_ts: file('global.d.ts'),
        index: file(`${wfs.basename(wfs.dirname(inPath))}-data.ts`),
        tsconfig_json: file('tsconfig.json'),
        datascripts_conf: file(`${wfs.basename(wfs.dirname(inPath))}-datascripts.conf`),
        build: dir({
            package_json: file('package.json')
        }),
        swcrc: file('../.swcrc')
    }))
}

export function LivescriptsDirectory(inPath: string) {
    const modname = wfs.basename(wfs.dirname(inPath));
    let fullModParts = inPath.split('\\').join('/').split('/')
    let fullModName = fullModParts.slice(
          fullModParts.indexOf('modules') + 1
        , fullModParts.indexOf('livescripts')
    ).join('.')

    return generateTree(inPath,dir({
        global_d_ts: file('global.d.ts'),
        tsconfig: file('tsconfig.json'),
        /** @todo: how to handle these names? */
        entry: file(`${modname}-scripts.ts`),
        built_libs: enumDir({RelWithDebInfo:0,Release:0,Debug:0},(type)=>({
            // todo: linux
            library: custom((value)=>new WFile(mpath(wfs.dirname(value),'build','lib',type,fullModName+'.dll'))),
            pdb: custom((value)=>new WFile(mpath(wfs.dirname(value),'build','lib',type,fullModName+'.pdb'))),
        })),
        built_library: file(``),
        built_pdb: file(``),
        build: dir({
            cpp: dir({
                livescripts: dir({}),
                cmakelists_txt: file('CMakeLists.txt'),
            }),
            lib: dir({})
        })
    }));
}

export function AddonDirectory(inPath: string) {
    return generateTree(inPath,dir({
        beforelib_toc: file('beforelib.toc'),
        before_toc: file('before.toc'),
        after_toc: file('after.toc'),
        module_toc: file(`${wfs.basename(wfs.dirname(inPath))}.toc`),
        index_ts: file(`${wfs.basename(wfs.dirname(inPath))}-addon.ts`),
        tsconfig_json: file('tsconfig.json'),
        global_d_ts: file('global.d.ts'),
        lib: dir({
            Events_ts: file('Events.ts'),
        }),
        build: dir({
            lualib_bundle_lua: file('lualib_bundle.lua'),
            lib: dir({}),
        }),
    }))
}

export function EndpointDirectory(inPath: string) {
    return generateTree(inPath,dir({
        addon: custom(inPath=>AddonDirectory(mpath(inPath,'addon'))),
        datascripts: custom(inPath=>DatascriptsDirectory(mpath(inPath,'datascripts'))),
        livescripts: custom(inPath=>LivescriptsDirectory(mpath(inPath,'livescripts'))),
        shared: dir({
            global_d_ts: file('global.d.ts')
        }),
        snippets: dir({}),
        datasets: dir({
            dataset: dynCustom((pathIn,nameIn)=>DatasetDirectory(pathIn,nameIn))
        }),
        realms: dir({
            realm: dynCustom((pathIn,nameIn)=>RealmDirectory(pathIn,nameIn))
        }),
        assets: dir({
            Interface: dir({
                WorldMap: dir({})
            }),

            textures: dir({
                minimap: dir({})
            })
        }),
        livescript_tsconfig_temp: file('tsconfig.json'),
    }));
}

export const Languages =
    [
        'enGB', 'koKR', 'frFR', 'deDE', 'enCN', 'zhCN',
        'enTW', 'zhTW', 'esES', 'esMX', 'ruRU',
        'ptPT', 'ptBR', 'itIT', 'Unk', 'enUS'
    ];
export function ClientPath(pathIn: string, devPatch: string) {
    return generateTree(pathIn,dir({
        /** The wow.exe used to start the game */
        wow_exe: file('wow.exe'),
        /** The wow.exe without any patches applied */
        wow_exe_clean: file('wow.exe.clean'),
        Data: dir({
            devPatch: file(devPatch),
            locale: function(){
                const self = new WDirectory(this.get())
                if(!self.exists()) {
                    throw new Error(
                        `No data directory at ${self.get()}`
                    )
                }
                let dirs = self.filter(x=>Languages.includes(x.basename().get()));
                if(dirs.length == 0) {
                    throw new Error(
                        `No locale directory found in ${self.get()}`
                    )
                }

                if(dirs.length > 1 ) {
                    throw new Error(
                          `Multiple locale directories found in ${self.get()}: `
                        + `${dirs.join(',')}`
                    )
                }

                return generateTree(dirs[0].get(),dir({
                    realmlist_wtf: file('realmlist.wtf')
                }))
            }
        }),
        ClientExtensions_dll: file('ClientExtensions.dll'),
        Cache: file('Cache'),
        Interface: dir({
            AddOns: dir({})
        })
    }))
}

export function InstallPath(pathIn: string, tdb: string) {
    return generateTree(pathIn,dir({
        vscode: dirn('.vscode',{
            snippets_out: file('tswow-generated.json.code-snippets')
        }),
        node_modules: dir({
            typescript_js: file('typescript/lib/tsc'),
            tstl_decorators: file('typescript-to-lua/dist/transformation/visitors/class/decorators.js'),
            tstl_js: file('typescript-to-lua/dist/tstl.js'),
            wotlkdata: dir({}),
        }),

        node_yaml: file('node.conf'),

        Crashes: dir({}),

        bin: dir({
            package: dir({
                file: dynfile(x=>x)
            }),
            changes: dir({
                changeFile: dynfile(name=>name)
            }),
            libraries: dir({
                build: enumDir({RelWithDebInfo:0,Release:0,Debug:0},(key)=>({})),
            }),
            mysql_startup: file('mysql_startup.txt'),
            addons: dir({}),
            revisions: dir({
                trinitycore: file('trinitycore'),
                tswow: file('tswow'),
            }),
            scripts: dir({
                addons: dir({
                    addons: dir({
                        require_preload: file('RequirePreload.js')
                    })
                }),
                tests: dir({}),
                runtime: dir({
                    runtime: dir({
                        TSWoW_js : file('TSWoW.js')
                    })
                }),
                typescript2cxx: dir({
                    typescript2cxx: dir({
                        wowts_js: file('wowts.js'),
                        main_js: file('main.js'),
                    })
                }),
                wotlkdata: dir({
                    package_json: file('package.json'),
                    wotlkdata: dir({
                        index: file('wotlkdata.js')
                    })
                }),
                snippets_example: file('snippets-example.ts'),
            }),
            adtcreator: dirn('adt-creator',{
                adtcreator_exe: file('adtcreator.exe'),
            }),
            mpqbuilder: dir({
                mpqbuilder_exe: file(`mpqbuilder${isWindows()?'.exe':''}`),
                luaxml_exe: file(`luaxmlreader${isWindows()?'.exe':''}`)
            }),
            mysql: dir({
                mysql_exe: file('mysql.exe'),
                mysqld_exe: file('mysqld.exe'),
                mysqldump_exe: file('mysqldump.exe'),
            }),
            sZip: dirn('7zip',{
                sza_exe: file('7za.exe')
            }),
            /** imagemagick binaries */
            im: dir({
                convert: file('convert.exe'),
                magick: file('magick.exe'),
                identify: file('identify.exe'),
            }),
            tdb: file(tdb),
            cmake: dir({
                bin: dir({
                    cmake_exe: file(`cmake.exe`)
                }),
                share: dir({})
            }),
            ClientExtensions_dll: file('ClientExtensions.dll'),
            include: dir({
                global_d_ts: file('global.d.ts'),
            }),
            BLPConverter: dir({
                blpconverter: file('blpconverter.exe')
            }),
            tmp: dir({
                file_changes_txt: file('file_changes.txt'),
            }),
            sql: dir({
                characters_create_sql: file('characters_create.sql'),
                auth_create_sql: file('auth_create.sql'),
                updates: dir({
                    type: enumDir({'world':0,'auth':0,'characters':0},(key)=>({
                        _335: dirn('3.3.5',{})
                    })),
                }),
                custom: dir({
                    type: enumDir({'world':0,'auth':0,'characters':0},(key)=>({

                    })),
                }),
            }),
            include_addon: dirn('include-addon',{
                global_d_ts: file('global.d.ts'),
                Events: file('Events.'),
                shared_global_d_ts: file('shared.global.d.ts'),
                LualibBundle_lua: file('LualibBundle.lua'),
                RequireStub_lua: file('RequireStub.lua'),
                tsconfig_json: file('tsconfig.json')
            }),
            trinitycore: dir({
                build: enumDir({RelWithDebInfo:0,Release:0,Debug:0},(key)=>({
                    scripts: dir({
                        moduleLib: dynfile((mod)=>isWindows()
                            ? `${wfs.dirname(mod)}/scripts_tswow_${wfs.basename(mod)}.dll`
                            : `${wfs.dirname(mod)}/libscripts_tswow_${wfs.basename(mod)}.so`
                        ),
                        modulePdb: dynfile(mod=>`scripts_tswow_${mod}.pdb`)
                    }),
                    worldserver: file(`worldserver${isWindows()?'.exe':''}`),
                    mapextractor: file(`mapextractor${isWindows()?'.exe':''}`),
                    mmaps_generator: file(`mmaps_generator${isWindows()?'.exe':''}`),
                    vmap4assembler: file(`vmap4assembler${isWindows()?'.exe':''}`),
                    vmap4extractor: file(`vmap4extractor${isWindows()?'.exe':''}`),
                    authserver: file(`authserver${isWindows()?'.exe':''}`),
                    authserver_conf_dist: file(`authserver.conf.dist`),
                    worldserver_conf_dist: file(`worldserver.conf.dist`),
                    libcrypto: file('libcrypto-1_1-x64.dll'),
                    configs: custom((i)=>generateTree(i,dir({}))),
                }))
            }),
        }),
        coredata: dir({
            positions_txt: file('positions.txt'),
            database: file('database'),
            authserver: dir({
                authserver_conf: file('authserver.conf')
            }),
            commands_yaml: file('commands.yaml'),
            terminal_history_txt: file('terminal-history.txt'),
        }),
        modules: dir({
            module: dyndir(name=>(({
                gitignore: file('.gitignore'),
                endpoints: function() {
                    const self = new WDirectory(this.get())
                    const endpoints : string[] = [
                          'datascripts'
                        , 'livescripts'
                        , 'realms'
                        , 'datasets'
                        , 'assets'
                        , 'addon'
                        , 'shared'
                    ]
                    let paths: WDirectory[] = [self]
                    self.iterate('RECURSE','DIRECTORIES','FULL',node=>{
                        if(node.endsWith('.git')) return 'ENDPOINT'
                        if(endpoints.includes(node.basename().get())) return 'ENDPOINT'
                        if(node.toDirectory()
                               .readDir('ABSOLUTE')
                               .find(x=>endpoints.find(y=>y==x.basename().get()))
                        ) {
                            paths.push(node.toDirectory())
                        }
                    })
                    return paths.map(x=>EndpointDirectory(x.get()))
                },
            })))
        }),
        package: dir({
            server_7z: file('server.7z'),
            file: dynfile(x=>`${x}.MPQ`),
        }),
        package_json: file('package.json'),
    }));
}

export function BuildPaths(pathIn: string, tdb: string) {
    return generateTree(pathIn, dir({
        release_7z: file('release.7z'),
        terminal_history: file('terminal-history.txt'),
        ClientExtensionsDll: file('ClientExtensions.dll'),
        scripts_config: dirn('scripts-config',{
            typescript2cxx: dir({}),
            wotlkdata: dir({}),
            runtime: dir({}),
            addons: dir({})
        }),
        zlib: dir({
            include: dir({}),
            lib: dir({
                zlib_lib: file('zlib.lib')
            })
        }),
        cmake: dir({
        }),

        mysql: dir({
            find_subdir: function() {
                return generateTree(path.join(this.get(),fs.readdirSync(this.get())[0]),dir({
                    bin: dir({
                        mysqld_exe: file('mysqld.exe'),
                        mysql_exe: file('mysql.exe'),
                        mysqldump_exe: file('mysqldump.exe')
                    }),
                    lib: dir({
                        libmysql_dll: file('libmysql.dll'),
                        libmysqld_dll: file('libmysqld.dll'),
                    })
                }))
            },
        }),

        openssl: dir({
            libcrypto: file('libcrypto-1_1-x64.dll')
        }),

        blpconverter: file('BLPConverter.exe'),
        tdb: file(tdb),
        sevenZip: dirn('7zip',{
            sevenZa_exe: file('7za.exe')
        }),
        im: dir({
            convert_exe: file('convert.exe'),
            magic_exe: file('magick.exe'),
            identify_exe: file('identify.exe'),
        }),

        TrinityCore: dir({
            // todo: linux
            bin: custom((k)=>(name: string)=>{
                return generateTree(mpath(k,'bin',name),dir({
                    worldserver_exe: file('worldserver.exe'),
                    authserver_exe: file('authserver.exe'),
                    scripts: dir({})
                }))
            }),

            configs: custom((k)=>(name: string)=>{
                return generateTree(mpath(k,'bin',name),dir({}))
            }),

            libraries: custom((pathIn=>(type: string)=>{
                return (isWindows() ?
                [
                    `dep/zlib/${type}/zlib.lib`,
                    `src/server/shared/${type}/shared.lib`,
                    `dep/SFMT/${type}/sfmt.lib`,
                    `dep/g3dlite/${type}/g3dlib.lib`,
                    `dep/fmt/${type}/fmt.lib`,
                    `dep/recastnavigation/Detour/${type}/detour.lib`,
                    `src/server/database/${type}/database.lib`,
                    `src/server/game/${type}/game.lib`,
                    `src/common/${type}/common.lib`,
                    `dep/argon2/${type}/argon2.lib`
                ]
                :
                [
                    `install/trinitycore/lib/libcommon.so`,
                    `install/trinitycore/lib/libdatabase.so`,
                    `install/trinitycore/lib/libgame.so`,
                    `install/trinitycore/lib/libshared.so`,
                ]
                ).map(x=>new WFile(mpath(pathIn,x)))
            })),

            libraries2: ((pathIn: string, type: string)=>(isWindows() ?
            [
                `dep/zlib/${type}/zlib.lib`,
                `src/server/shared/${type}/shared.lib`,
                `dep/SFMT/${type}/sfmt.lib`,
                `dep/g3dlite/${type}/g3dlib.lib`,
                `dep/fmt/${type}/fmt.lib`,
                `dep/recastnavigation/Detour/${type}/detour.lib`,
                `src/server/database/${type}/database.lib`,
                `src/server/game/${type}/game.lib`,
                `src/common/${type}/common.lib`,
                `dep/argon2/${type}/argon2.lib`
            ]
            :
            [
                `install/trinitycore/lib/libcommon.so`,
                `install/trinitycore/lib/libdatabase.so`,
                `install/trinitycore/lib/libgame.so`,
                `install/trinitycore/lib/libshared.so`,
            ]).map(x=>new WFile(pathIn).join(x)))
        }),

        mpqbuilder: dir({
            mpqbuilder_exe: file(isWindows() ? 'Release/mpqbuilder.exe' : 'mpqbuilder'),
            luaxml_exe: file(isWindows() ? 'Release/luaxmlreader.exe' : 'luaxmlreader')
        }),

        adtcreator: dir({
            Release: dir({
                adt_creator_exe: file(`adt-creator${isWindows()?'.exe':''}`)
            })
        }),

        bzip2: dir({
            lib: dir({
                bzip2_lib: file('bzip2.lib')
            })
        }),
    }))
}

export function SourcePaths(pathIn: string) {
    return generateTree(pathIn,dir({
        package_json: file('package.json'),
        node_modules: dir({
            typescript_js: file('typescript/lib/tsc'),
        }),
        tools: dir({
            mpqbuilder: dir({})
        }),

        install_config: dirn('install-config',{
            include_addon: dirn('include-addon',{
                global_d_ts: file('global.d.ts'),
                Events: file('Events.'),
                shared_global_d_ts: file('shared.global.d.ts'),
                LualibBundle_lua: file('LualibBundle.lua'),
                RequireStub_lua: file('RequireStub.lua'),
            }),
            characters_create: file('characters_create.sql'),
            auth_create: file('auth_create.sql'),
            package_json: file('package.json'),
            node_yaml: file('node.yaml'),
            vscode_install : file('.vscode-install'),
            addons: dir({}),
            snippet_example: file('snippet-example.ts')
        }),

        client_extensions: dirn('client-extensions',{
            CustomPackets: dir({})
        }),

        TrinityCore: dir({
            src: dir({}),
            sql: dir({
                updates: dir({}),
                custom: dir({})
            })
        }),
        tswow_scripts: dirn('tswow-scripts', {
            sql: dir({}),
            wotlkdata: dir({
                package_json: file('package.json')
            }),
            runtime: dir({}),
            typescript2cxx: dir({}),
            util: dir({}),
            addons: dir({}),
        }),

        TypeScript2Cxx: dir({}),

        tswow_core: dirn('tswow-core',{
            /** Contains all public headers for tswow livescripts */
            Public: dir({
                /** Contains global.d.ts placed in livescripts */
                global_d_ts: file('global.d.ts'),
            }),
        }),
        ClientExtensions: dir({
            CustomPackets: dir({}),
        }),
        build_yaml: dir({}),
    }))
}

export const ipaths = function(){
    let arg = process.argv.find(x=>x.startsWith('--ipaths='));
    if(arg === undefined) {
        throw new Error(`No --ipaths argument provided`);
    }
    return InstallPath(arg.substring('--ipaths='.length),tdbFilename())
}();

export function collectSubmodules(modulesIn: string[]) {
    // remove modules contained in other modules
    modulesIn = modulesIn
        .map(x=>x.split('.').join(path.sep))
        .filter(x=>modulesIn.find(y=>!wfs.relative(y,x).startsWith('..')))

    // hack: using submodules as module names
    return modulesIn
        .map(x=>ipaths.modules.module.pick(x).endpoints())
        .reduce((p,c)=>p.concat(c))
}
