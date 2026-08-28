-- ============================================================
-- EnfermerosYa — Esquema de base de datos (PostgreSQL)
-- PK: UUID (gen_random_uuid)
-- ============================================================

BEGIN;

-- Extensiones -------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- Tipos enumerados ---------------------------------------------
CREATE TYPE user_role AS ENUM ('patient', 'professional', 'admin');

CREATE TYPE availability_status AS ENUM ('online', 'offline', 'disponible', 'ocupado');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TYPE appointment_type AS ENUM ('consulta', 'control', 'practica', 'e-consulta', 'curacion');
CREATE TYPE appointment_modality AS ENUM ('presencial', 'domicilio', 'online');
CREATE TYPE appointment_status AS ENUM ('pendiente', 'confirmada', 'en-curso', 'finalizada', 'cancelada');

CREATE TYPE payment_method AS ENUM ('tarjeta', 'mercado_pago', 'transferencia', 'efectivo');
CREATE TYPE payment_status AS ENUM ('pendiente', 'pagado', 'reembolsado');

CREATE TYPE notification_kind AS ENUM ('appointment', 'message', 'payment', 'system');
CREATE TYPE document_kind AS ENUM ('informe', 'estudio', 'receta', 'indicacion', 'dni', 'matricula', 'titulo', 'certificaciones');
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'rejected');

-- ============================================================
-- USUARIOS (raíz de todo el sistema)
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name    VARCHAR(120) NOT NULL,
  last_name     VARCHAR(120) NOT NULL,
  phone         VARCHAR(40),
  role          user_role NOT NULL DEFAULT 'patient',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PERFILES PROFESIONALES
-- ============================================================
CREATE TABLE professional_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profession          VARCHAR(60) NOT NULL,          -- 'medico' | 'enfermero' | ...
  specialty_id        UUID,                           -- FK -> specialties
  license_number      VARCHAR(60),
  license_province    VARCHAR(60),
  verification_status verification_status NOT NULL DEFAULT 'pending',
  availability_status availability_status NOT NULL DEFAULT 'offline',
  headline            VARCHAR(160),
  description         TEXT,
  experience_years    INTEGER,
  birth_date          DATE,
  dni                 VARCHAR(20),
  rating              NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count       INTEGER NOT NULL DEFAULT 0,
  consultations_count INTEGER NOT NULL DEFAULT 0,

  -- ubicación
  address_street      VARCHAR(160),
  address_number      VARCHAR(20),
  address_floor       VARCHAR(10),
  address_apartment   VARCHAR(10),
  address_city        VARCHAR(80),
  address_province    VARCHAR(80),
  address_zip_code    VARCHAR(20),
  address_zone        VARCHAR(160),   -- zona / barrio para mostrar
  latitude            NUMERIC(9,6),
  longitude           NUMERIC(9,6),
  show_approximate_location BOOLEAN NOT NULL DEFAULT FALSE,

  -- modalidades de atención
  accepts_home_visits BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_in_office   BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_online      BOOLEAN NOT NULL DEFAULT FALSE,
  available_now       BOOLEAN NOT NULL DEFAULT FALSE,
  available_today     BOOLEAN NOT NULL DEFAULT FALSE,
  price_from          NUMERIC(12,2) NOT NULL DEFAULT 0,
  e_consult_price     NUMERIC(12,2) NOT NULL DEFAULT 0,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_professional_user     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ESPECIALIDADES
-- ============================================================
CREATE TABLE specialties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(120) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- FK de specialty_id en professional_profiles
ALTER TABLE professional_profiles
  ADD CONSTRAINT fk_professional_specialty
  FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL;

-- ============================================================
-- SERVICIOS OFRECIDOS por un profesional
-- ============================================================
CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL,
  name             VARCHAR(160) NOT NULL,
  description      TEXT,
  price            NUMERIC(12,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  modality         appointment_modality NOT NULL DEFAULT 'presencial', -- modalidad principal
  is_e_consult     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_service_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- PERFILES PACIENTES
-- ============================================================
CREATE TABLE patient_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL,
  birth_date              DATE,
  dni                     VARCHAR(20),
  health_insurance        VARCHAR(120),
  address_street          VARCHAR(160),
  address_city            VARCHAR(80),
  address_province        VARCHAR(80),
  address_zip_code        VARCHAR(20),
  emergency_contact_name  VARCHAR(120),
  emergency_contact_phone VARCHAR(40),
  notes                   TEXT,
  last_visit_at           TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- DOCUMENTOS DE VERIFICACIÓN del profesional
-- ============================================================
CREATE TABLE verification_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  kind          document_kind NOT NULL,
  file_name     VARCHAR(255),
  file_path     VARCHAR(500),
  status        document_status NOT NULL DEFAULT 'pending',
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_vdoc_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- CITAS / CONSULTAS (appointments)
-- ============================================================
CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL,
  patient_id       UUID NOT NULL,
  service_id       UUID,
  type             appointment_type NOT NULL DEFAULT 'consulta',
  modality         appointment_modality NOT NULL DEFAULT 'presencial',
  status           appointment_status NOT NULL DEFAULT 'pendiente',
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  reason           TEXT,
  notes            TEXT,
  price            NUMERIC(12,2) NOT NULL,
  cancelled_by     VARCHAR(20),           -- 'paciente' | 'profesional'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_appointment_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointment_patient       FOREIGN KEY (patient_id)       REFERENCES patient_profiles(id)       ON DELETE CASCADE,
  CONSTRAINT fk_appointment_service       FOREIGN KEY (service_id)       REFERENCES services(id)               ON DELETE SET NULL,
  CONSTRAINT check_appointment_dates      CHECK (ends_at > starts_at)
);

-- ============================================================
-- DISPONIBILIDAD PROFESIONAL
-- ============================================================
-- Horarios semanales: 1-7 (Lun-Dom), varios rangos por día
CREATE TABLE availability_weekly (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL,
  weekday          SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  is_e_consult     BOOLEAN NOT NULL DEFAULT FALSE, -- franja para e-consultas
  CONSTRAINT fk_avail_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- Bloqueos puntuales de fechas
CREATE TABLE availability_blocked_dates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL,
  blocked_date     DATE NOT NULL,
  CONSTRAINT fk_blocked_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  UNIQUE (professional_id, blocked_date)
);

-- Licencias / ausencias extendidas
CREATE TABLE availability_leaves (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL,
  from_date        DATE NOT NULL,
  to_date          DATE NOT NULL,
  label            VARCHAR(160),
  CONSTRAINT fk_leave_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  CONSTRAINT check_leave_period     CHECK (to_date >= from_date)
);

-- Preferencias de turnos
CREATE TABLE availability_settings (
  professional_id      UUID PRIMARY KEY,
  appointment_duration INTEGER NOT NULL DEFAULT 30,
  buffer_minutes       INTEGER NOT NULL DEFAULT 10,
  min_booking_notice_hours INTEGER NOT NULL DEFAULT 4,
  e_consult_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  e_consult_duration   INTEGER NOT NULL DEFAULT 20,
  e_consult_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_avail_settings_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- PAGOS
-- ============================================================
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   UUID,
  professional_id  UUID NOT NULL,
  service_name     VARCHAR(160),
  amount           NUMERIC(12,2) NOT NULL,
  method           payment_method NOT NULL DEFAULT 'tarjeta',
  status           payment_status NOT NULL DEFAULT 'pendiente',
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_payment_appointment  FOREIGN KEY (appointment_id)  REFERENCES appointments(id)          ON DELETE SET NULL,
  CONSTRAINT fk_payment_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- MENSAJES
-- ============================================================
CREATE TABLE conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL,
  patient_id       UUID NOT NULL,
  last_message_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_conv_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_patient       FOREIGN KEY (patient_id)       REFERENCES patient_profiles(id)       ON DELETE CASCADE,
  UNIQUE (professional_id, patient_id)
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_role     user_role NOT NULL,   -- quién envía ('patient' | 'professional')
  text            TEXT,
  attachment_name VARCHAR(255),
  attachment_url  VARCHAR(500),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- ============================================================
-- DOCUMENTOS MÉDICOS (del paciente)
-- ============================================================
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL,
  professional_id UUID,
  kind          document_kind NOT NULL,
  title         VARCHAR(255),
  file_name     VARCHAR(255),
  file_path     VARCHAR(500),
  size_label    VARCHAR(40),
  status        document_status NOT NULL DEFAULT 'pending',
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_doc_patient       FOREIGN KEY (patient_id)       REFERENCES patient_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_professional  FOREIGN KEY (professional_id) REFERENCES professional_profiles(id) ON DELETE SET NULL
);

-- ============================================================
-- NOTIFICACIONES
-- ============================================================
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  kind       notification_kind NOT NULL DEFAULT 'system',
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ÍNDICES de búsqueda y optimización
-- ============================================================
CREATE INDEX idx_profiles_user        ON professional_profiles(user_id);
CREATE INDEX idx_profiles_specialty   ON professional_profiles(specialty_id);
CREATE INDEX idx_profiles_city        ON professional_profiles(address_city);
CREATE INDEX idx_profiles_status      ON professional_profiles(availability_status);

CREATE INDEX idx_services_pro         ON services(professional_id);

CREATE INDEX idx_patients_user        ON patient_profiles(user_id);
CREATE INDEX idx_vdocs_professional   ON verification_documents(professional_id);

CREATE INDEX idx_appointments_pro     ON appointments(professional_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_starts  ON appointments(starts_at);
CREATE INDEX idx_appointments_status  ON appointments(status);

CREATE INDEX idx_avail_weekly_pro     ON availability_weekly(professional_id);
CREATE INDEX idx_avail_blocked_pro    ON availability_blocked_dates(professional_id);
CREATE INDEX idx_avail_leaves_pro     ON availability_leaves(professional_id);

CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_pro         ON payments(professional_id);
CREATE INDEX idx_payments_status      ON payments(status);

CREATE INDEX idx_conversations_pro    ON conversations(professional_id);
CREATE INDEX idx_conversations_patient ON conversations(patient_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

CREATE INDEX idx_documents_patient    ON documents(patient_id);
CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_read   ON notifications(is_read);

-- ============================================================
-- AUDITORÍA: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated   BEFORE UPDATE ON users                 FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON professional_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patient_profiles     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments     FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
