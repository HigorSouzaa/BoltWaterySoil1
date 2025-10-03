/*
  # Create Environments, Sectors, Arduino Modules, and Maintenance Tables

  1. New Tables
    - `environments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Environment name (e.g., "Fazenda São João")
      - `description` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sectors`
      - `id` (uuid, primary key)
      - `environment_id` (uuid, foreign key to environments)
      - `name` (text) - Sector name (e.g., "Setor A")
      - `description` (text, nullable)
      - `is_active` (boolean) - Current active sector flag
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `arduino_modules`
      - `id` (uuid, primary key)
      - `sector_id` (uuid, foreign key to sectors)
      - `name` (text) - Module name/identifier
      - `module_type` (text) - Type of module (sensor, actuator, etc.)
      - `status` (text) - operational, offline, error
      - `ip_address` (text, nullable)
      - `last_ping` (timestamptz, nullable)
      - `configuration` (jsonb) - Module-specific settings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `maintenance_schedules`
      - `id` (uuid, primary key)
      - `sector_id` (uuid, foreign key to sectors)
      - `arduino_module_id` (uuid, nullable, foreign key to arduino_modules)
      - `title` (text)
      - `description` (text, nullable)
      - `scheduled_date` (timestamptz)
      - `completed_date` (timestamptz, nullable)
      - `status` (text) - pending, completed, overdue
      - `priority` (text) - low, medium, high
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_preferences`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `active_environment_id` (uuid, nullable, foreign key to environments)
      - `active_sector_id` (uuid, nullable, foreign key to sectors)
      - `theme` (text) - light, dark, auto
      - `notifications_enabled` (boolean)
      - `language` (text)
      - `settings` (jsonb) - Additional user settings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access environments, sectors, and modules they own
    - Maintenance schedules are accessible by sector owners
*/

-- Create environments table
CREATE TABLE IF NOT EXISTS environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own environments"
  ON environments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own environments"
  ON environments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own environments"
  ON environments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own environments"
  ON environments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sectors table
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id uuid REFERENCES environments(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sectors in their environments"
  ON sectors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM environments
      WHERE environments.id = sectors.environment_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sectors in their environments"
  ON sectors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM environments
      WHERE environments.id = environment_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sectors in their environments"
  ON sectors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM environments
      WHERE environments.id = sectors.environment_id
      AND environments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM environments
      WHERE environments.id = environment_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sectors in their environments"
  ON sectors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM environments
      WHERE environments.id = sectors.environment_id
      AND environments.user_id = auth.uid()
    )
  );

-- Create arduino_modules table
CREATE TABLE IF NOT EXISTS arduino_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid REFERENCES sectors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  module_type text NOT NULL DEFAULT 'sensor',
  status text DEFAULT 'offline',
  ip_address text,
  last_ping timestamptz,
  configuration jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE arduino_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view modules in their sectors"
  ON arduino_modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = arduino_modules.sector_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert modules in their sectors"
  ON arduino_modules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = sector_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modules in their sectors"
  ON arduino_modules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = arduino_modules.sector_id
      AND environments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = sector_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modules in their sectors"
  ON arduino_modules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = arduino_modules.sector_id
      AND environments.user_id = auth.uid()
    )
  );

-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid REFERENCES sectors(id) ON DELETE CASCADE NOT NULL,
  arduino_module_id uuid REFERENCES arduino_modules(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  completed_date timestamptz,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance in their sectors"
  ON maintenance_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = maintenance_schedules.sector_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert maintenance in their sectors"
  ON maintenance_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = sector_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update maintenance in their sectors"
  ON maintenance_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = maintenance_schedules.sector_id
      AND environments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = sector_id
      AND environments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete maintenance in their sectors"
  ON maintenance_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sectors
      JOIN environments ON environments.id = sectors.environment_id
      WHERE sectors.id = maintenance_schedules.sector_id
      AND environments.user_id = auth.uid()
    )
  );

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_environment_id uuid REFERENCES environments(id) ON DELETE SET NULL,
  active_sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  theme text DEFAULT 'light',
  notifications_enabled boolean DEFAULT true,
  language text DEFAULT 'pt-BR',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_environments_user_id ON environments(user_id);
CREATE INDEX IF NOT EXISTS idx_sectors_environment_id ON sectors(environment_id);
CREATE INDEX IF NOT EXISTS idx_sectors_is_active ON sectors(is_active);
CREATE INDEX IF NOT EXISTS idx_arduino_modules_sector_id ON arduino_modules(sector_id);
CREATE INDEX IF NOT EXISTS idx_arduino_modules_status ON arduino_modules(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_sector_id ON maintenance_schedules(sector_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);