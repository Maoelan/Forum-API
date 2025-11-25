exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"(id)',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: false,
      default: false,
    },
  });

  pgm.createIndex('replies', 'comment_id');
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
