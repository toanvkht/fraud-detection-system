/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
// migrations/*_init_schema.js
exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username',150).notNullable().unique();
      table.string('email',255).unique();
      table.string('password_hash',255);
      table.string('role',50).notNullable().defaultTo('user');
      table.boolean('disabled').notNullable().defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('known_phishing_urls', table => {
      table.increments('id').primary();
      table.text('url').notNullable();
      table.string('domain',255).index();
      table.string('source',100);
      table.string('severity',50);
      table.timestamp('first_seen_at');
      table.timestamp('last_seen_at');
      table.text('notes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('suspicious_urls', table => {
      table.increments('id').primary();
      table.text('url').notNullable();
      table.string('domain',255).index();
      table.integer('reported_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('collection_source',50);
      table.string('pre_scan_status',50).defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('url_checks', table => {
      table.increments('id').primary();
      table.integer('suspicious_url_id').unsigned().references('id').inTable('suspicious_urls').onDelete('CASCADE');
      table.string('initiator',50);
      table.integer('initiator_user_id').references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('finished_at');
      table.string('algorithm_version',50);
      table.float('algorithm_score');
      table.string('safebrowsing_status',50);
      table.jsonb('safebrowsing_response');
      table.integer('feed_match_count').defaultTo(0);
      table.string('aggregated_recommendation',20);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('scan_results', table => {
      table.increments('id').primary();
      table.integer('url_check_id').unsigned().references('id').inTable('url_checks').onDelete('CASCADE');
      table.string('component',100);
      table.float('score');
      table.jsonb('details');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('safebrowsing_cache', table => {
      table.increments('id').primary();
      table.text('url');
      table.string('domain',255).index();
      table.string('safebrowsing_status',100);
      table.jsonb('response_json');
      table.timestamp('last_checked_at');
      table.timestamp('ttl_until');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('feed_imports', table => {
      table.increments('id').primary();
      table.string('feed_name',255);
      table.timestamp('imported_at').defaultTo(knex.fn.now());
      table.integer('row_count');
      table.jsonb('sample_payload');
    })

    .createTable('feed_items', table => {
      table.increments('id').primary();
      table.integer('feed_import_id').unsigned().references('id').inTable('feed_imports').onDelete('CASCADE');
      table.text('url').notNullable();
      table.string('domain',255).index();
      table.jsonb('raw');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('feed_matches', table => {
      table.increments('id').primary();
      table.integer('url_check_id').unsigned().references('id').inTable('url_checks').onDelete('CASCADE');
      table.integer('feed_item_id').unsigned().references('id').inTable('feed_items').onDelete('SET NULL');
      table.integer('known_phishing_id').unsigned().references('id').inTable('known_phishing_urls').onDelete('SET NULL');
      table.string('feed_name',255);
      table.string('match_type',50);
      table.jsonb('details');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('reports', table => {
      table.increments('id').primary();
      table.integer('suspicious_url_id').unsigned().references('id').inTable('suspicious_urls').onDelete('CASCADE');
      table.integer('reporter_user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.string('channel',50);
      table.text('details');
      table.string('status',50).defaultTo('open');
      table.integer('moderator_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('reviewed_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('extension_telemetry', table => {
      table.bigIncrements('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.string('event_type',100);
      table.text('url');
      table.string('domain',255).index();
      table.jsonb('payload');
      table.string('ip_region',100);
      table.text('user_agent');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('alerts', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('suspicious_url_id').unsigned().references('id').inTable('suspicious_urls').onDelete('SET NULL');
      table.integer('url_check_id').unsigned().references('id').inTable('url_checks').onDelete('SET NULL');
      table.string('alert_type',100);
      table.string('severity',20);
      table.text('message');
      table.boolean('is_read').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('audit_logs', table => {
      table.bigIncrements('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.string('action',150);
      table.string('object_type',100);
      table.integer('object_id');
      table.jsonb('metadata');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('alerts')
    .dropTableIfExists('extension_telemetry')
    .dropTableIfExists('reports')
    .dropTableIfExists('feed_matches')
    .dropTableIfExists('feed_items')
    .dropTableIfExists('feed_imports')
    .dropTableIfExists('safebrowsing_cache')
    .dropTableIfExists('scan_results')
    .dropTableIfExists('url_checks')
    .dropTableIfExists('suspicious_urls')
    .dropTableIfExists('known_phishing_urls')
    .dropTableIfExists('users');
};

