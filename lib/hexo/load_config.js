'use strict';

const merge = require('lodash/merge');
const { sep, resolve, join, parse } = require('path');
const tildify = require('tildify');
const Theme = require('../theme');
const Source = require('./source');
const fs = require('hexo-fs');
const chalk = require('chalk');

module.exports = ctx => {
  if (!ctx.env.init) return;

  const baseDir = ctx.base_dir;
  let configPath = ctx.config_path;

  return fs.exists(configPath).then(exist => {
    return exist ? configPath : findConfigPath(configPath);
  }).then(path => {
    if (!path) return;

    configPath = path;
    return ctx.render.render({path});
  }).then(config => {
    if (!config || typeof config !== 'object') return;

    ctx.log.debug('Config loaded: %s', chalk.magenta(tildify(configPath)));

    config = merge(ctx.config, config);
    ctx.config_path = configPath;

    config.root = config.root.replace(/\/*$/, '/');
    config.url = config.url.replace(/\/+$/, '');

    ctx.public_dir = resolve(baseDir, config.public_dir) + sep;
    ctx.source_dir = resolve(baseDir, config.source_dir) + sep;
    ctx.source = new Source(ctx);

    if (!config.theme) return;

    config.theme = config.theme.toString();
    ctx.theme_dir = join(baseDir, config.theme) + sep;
    ctx.theme_script_dir = join(ctx.theme_dir, 'scripts') + sep;
    ctx.theme = new Theme(ctx);
  });
};

function findConfigPath(path) {
  const { dir, name } = parse(path);

  return fs.readdir(dir).then(files => {
    const item = files.find(item => item.startsWith(name));
    if (item != null) return join(dir, item);
  });
}
