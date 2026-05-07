-- artist_categories: browse by category
create index idx_artist_categories_category on artist_categories (category);

-- bookings: availability checks and dashboards
create index idx_bookings_artist_event_date  on bookings (artist_id, event_date)    where deleted_at is null;
create index idx_bookings_organizer_status   on bookings (organizer_id, status)     where deleted_at is null;
create index idx_bookings_artist_status      on bookings (artist_id, status)        where deleted_at is null;

-- messages: chat scroll
create index idx_messages_conversation_time  on messages (conversation_id, created_at desc);

-- reviews: profile aggregation
create index idx_reviews_reviewee on reviews (reviewee_id);

-- notifications: inbox unread
create index idx_notifications_user_unread
  on notifications (user_id, created_at desc)
  where read_at is null;

-- portfolio_items: profile portfolio render
create index idx_portfolio_items_artist_order
  on portfolio_items (artist_id, sort_order)
  where deleted_at is null;

-- availability_blocks: overlap lookup
create index idx_availability_blocks_artist_dates
  on availability_blocks (artist_id, start_date, end_date);
