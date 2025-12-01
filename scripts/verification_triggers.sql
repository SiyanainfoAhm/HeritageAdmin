-- =====================================================
-- VERIFICATION TRIGGERS FOR HERITAGE ADMIN
-- Run this script in Supabase SQL Editor
-- =====================================================

-- 1. Trigger for heritage_artisan changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_artisan_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.artisan_name IS DISTINCT FROM NEW.artisan_name OR
      OLD.short_bio IS DISTINCT FROM NEW.short_bio OR
      OLD.full_bio IS DISTINCT FROM NEW.full_bio OR
      OLD.craft_title IS DISTINCT FROM NEW.craft_title OR
      OLD.craft_specialty IS DISTINCT FROM NEW.craft_specialty OR
      OLD.experience_years IS DISTINCT FROM NEW.experience_years OR
      OLD.address_line1 IS DISTINCT FROM NEW.address_line1 OR
      OLD.awards IS DISTINCT FROM NEW.awards) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
    
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_artisan_change ON heritage_artisan;
CREATE TRIGGER trg_reset_verified_on_artisan_change
BEFORE UPDATE ON heritage_artisan
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_artisan_change();

-- 2. Trigger for heritage_local_guide_profile changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_local_guide_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.bio IS DISTINCT FROM NEW.bio OR
      OLD.languages IS DISTINCT FROM NEW.languages OR
      OLD.specializations IS DISTINCT FROM NEW.specializations OR
      OLD.certifications IS DISTINCT FROM NEW.certifications OR
      OLD.primary_city IS DISTINCT FROM NEW.primary_city OR
      OLD.primary_state IS DISTINCT FROM NEW.primary_state OR
      OLD.hourly_rate IS DISTINCT FROM NEW.hourly_rate OR
      OLD.half_day_rate IS DISTINCT FROM NEW.half_day_rate OR
      OLD.full_day_rate IS DISTINCT FROM NEW.full_day_rate OR
      OLD.availability_days IS DISTINCT FROM NEW.availability_days) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
    
    NEW.verification_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_local_guide_change ON heritage_local_guide_profile;
CREATE TRIGGER trg_reset_verified_on_local_guide_change
BEFORE UPDATE ON heritage_local_guide_profile
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_local_guide_change();

-- 3. Trigger for heritage_eventorganizer_business_details changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_event_operator_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.business_name IS DISTINCT FROM NEW.business_name OR
      OLD.address IS DISTINCT FROM NEW.address OR
      OLD.city IS DISTINCT FROM NEW.city OR
      OLD.state IS DISTINCT FROM NEW.state OR
      OLD.pincode IS DISTINCT FROM NEW.pincode) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_event_operator_change ON heritage_eventorganizer_business_details;
CREATE TRIGGER trg_reset_verified_on_event_operator_change
BEFORE UPDATE ON heritage_eventorganizer_business_details
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_event_operator_change();

-- 4. Trigger for heritage_tour_operator_businessdetails changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_tour_operator_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.business_name IS DISTINCT FROM NEW.business_name OR
      OLD.address IS DISTINCT FROM NEW.address OR
      OLD.city IS DISTINCT FROM NEW.city OR
      OLD.state IS DISTINCT FROM NEW.state OR
      OLD.pincode IS DISTINCT FROM NEW.pincode) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_tour_operator_change ON heritage_tour_operator_businessdetails;
CREATE TRIGGER trg_reset_verified_on_tour_operator_change
BEFORE UPDATE ON heritage_tour_operator_businessdetails
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_tour_operator_change();

-- 5. Trigger for heritage_foodvendorbusinessdetails changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_food_vendor_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.business_name IS DISTINCT FROM NEW.business_name OR
      OLD.business_type IS DISTINCT FROM NEW.business_type OR
      OLD.business_address IS DISTINCT FROM NEW.business_address OR
      OLD.state IS DISTINCT FROM NEW.state OR
      OLD.pincode IS DISTINCT FROM NEW.pincode) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_food_vendor_change ON heritage_foodvendorbusinessdetails;
CREATE TRIGGER trg_reset_verified_on_food_vendor_change
BEFORE UPDATE ON heritage_foodvendorbusinessdetails
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_food_vendor_change();

-- 6. Trigger for heritage_hotelownerbusinessdetails changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_hotel_owner_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.business_name IS DISTINCT FROM NEW.business_name OR
      OLD.business_type IS DISTINCT FROM NEW.business_type OR
      OLD.gstin IS DISTINCT FROM NEW.gstin OR
      OLD.business_phone IS DISTINCT FROM NEW.business_phone OR
      OLD.business_email IS DISTINCT FROM NEW.business_email OR
      OLD.business_address IS DISTINCT FROM NEW.business_address OR
      OLD.city IS DISTINCT FROM NEW.city OR
      OLD.state IS DISTINCT FROM NEW.state OR
      OLD.pincode IS DISTINCT FROM NEW.pincode) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_hotel_owner_change ON heritage_hotelownerbusinessdetails;
CREATE TRIGGER trg_reset_verified_on_hotel_owner_change
BEFORE UPDATE ON heritage_hotelownerbusinessdetails
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_hotel_owner_change();

-- 7. Trigger for heritage_user profile changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.full_name IS DISTINCT FROM NEW.full_name OR
      OLD.phone IS DISTINCT FROM NEW.phone OR
      OLD.email IS DISTINCT FROM NEW.email) AND
     (OLD.user_type_verified IS NOT DISTINCT FROM NEW.user_type_verified) THEN
    
    NEW.user_type_verified := false;
    NEW.verified_on := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_profile_change ON heritage_user;
CREATE TRIGGER trg_reset_verified_on_profile_change
BEFORE UPDATE ON heritage_user
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_profile_change();

-- 8. Trigger for heritage_user_documents changes (INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION reset_user_verified_on_document_change()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id BIGINT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;
  
  UPDATE heritage_user 
  SET user_type_verified = false, verified_on = NULL
  WHERE user_id = target_user_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_document_insert ON heritage_user_documents;
CREATE TRIGGER trg_reset_verified_on_document_insert
AFTER INSERT ON heritage_user_documents
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_document_change();

DROP TRIGGER IF EXISTS trg_reset_verified_on_document_update ON heritage_user_documents;
CREATE TRIGGER trg_reset_verified_on_document_update
AFTER UPDATE ON heritage_user_documents
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_document_change();

DROP TRIGGER IF EXISTS trg_reset_verified_on_document_delete ON heritage_user_documents;
CREATE TRIGGER trg_reset_verified_on_document_delete
AFTER DELETE ON heritage_user_documents
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_document_change();

-- 9. Trigger for Heritage_VendorBusinessDetails changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_vendor_business_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.business_name IS DISTINCT FROM NEW.business_name OR
      OLD.business_type IS DISTINCT FROM NEW.business_type OR
      OLD.gstin IS DISTINCT FROM NEW.gstin OR
      OLD.business_phone IS DISTINCT FROM NEW.business_phone OR
      OLD.business_email IS DISTINCT FROM NEW.business_email OR
      OLD.business_address IS DISTINCT FROM NEW.business_address OR
      OLD.city IS DISTINCT FROM NEW.city OR
      OLD.state IS DISTINCT FROM NEW.state OR
      OLD.pincode IS DISTINCT FROM NEW.pincode OR
      OLD.business_description IS DISTINCT FROM NEW.business_description OR
      OLD.license_number IS DISTINCT FROM NEW.license_number OR
      OLD.license_expiry IS DISTINCT FROM NEW.license_expiry OR
      OLD.website IS DISTINCT FROM NEW.website) THEN
    
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = NEW.user_id;
    
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_vendor_business_change ON Heritage_VendorBusinessDetails;
CREATE TRIGGER trg_reset_verified_on_vendor_business_change
BEFORE UPDATE ON Heritage_VendorBusinessDetails
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_vendor_business_change();

-- 10. Trigger for Heritage_VendorBusinessDetailsTranslation changes
CREATE OR REPLACE FUNCTION reset_user_verified_on_vendor_translation_change()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id BIGINT;
BEGIN
  -- Get user_id from business_id
  SELECT user_id INTO target_user_id
  FROM Heritage_VendorBusinessDetails
  WHERE business_id = COALESCE(NEW.business_id, OLD.business_id);
  
  IF target_user_id IS NOT NULL THEN
    UPDATE heritage_user 
    SET user_type_verified = false, verified_on = NULL
    WHERE user_id = target_user_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_verified_on_vendor_translation_insert ON Heritage_VendorBusinessDetailsTranslation;
CREATE TRIGGER trg_reset_verified_on_vendor_translation_insert
AFTER INSERT ON Heritage_VendorBusinessDetailsTranslation
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_vendor_translation_change();

DROP TRIGGER IF EXISTS trg_reset_verified_on_vendor_translation_update ON Heritage_VendorBusinessDetailsTranslation;
CREATE TRIGGER trg_reset_verified_on_vendor_translation_update
AFTER UPDATE ON Heritage_VendorBusinessDetailsTranslation
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_vendor_translation_change();

DROP TRIGGER IF EXISTS trg_reset_verified_on_vendor_translation_delete ON Heritage_VendorBusinessDetailsTranslation;
CREATE TRIGGER trg_reset_verified_on_vendor_translation_delete
AFTER DELETE ON Heritage_VendorBusinessDetailsTranslation
FOR EACH ROW
EXECUTE FUNCTION reset_user_verified_on_vendor_translation_change();

-- =====================================================
-- DONE! All triggers created successfully.
-- =====================================================

