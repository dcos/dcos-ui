import * as React from "react";
import { shallow } from "enzyme";
import { LanguagePreferenceFormModalComponent } from "../LanguagePreferenceFormModal";
import UserSettingsStore from "../../../stores/UserSettingsStore";
import { SAVED_STATE_KEY } from "../../../constants/UserSettings";
import FormModal from "../../FormModal";

const defaultLanguage = "en";
const newLanguage = "zh";
const mockFormData = { language: newLanguage };

describe("LanguagePreferenceFormModalComponent", () => {
  beforeEach(() => {
    UserSettingsStore.setKey(SAVED_STATE_KEY, { language: defaultLanguage });
  });

  it("renders with default language", () => {
    const component = shallow(<LanguagePreferenceFormModalComponent />);
    expect(component).toMatchSnapshot();
  });

  describe("when submitting", () => {
    it("sets isOpen to false", () => {
      const component = shallow(
        <LanguagePreferenceFormModalComponent isOpen={true} />
      );
      expect(component.state("isOpen")).toBe(true);
      component.find(FormModal).props().onSubmit(mockFormData);
      expect(component.state("isOpen")).toBe(false);
    });

    it("calls handleLanguagePrefSubmit with new language", () => {
      const handleLanguagePrefSubmitSpy = spyOn(
        LanguagePreferenceFormModalComponent.prototype,
        "handleLanguagePrefSubmit"
      );
      const component = shallow(<LanguagePreferenceFormModalComponent />);
      expect(handleLanguagePrefSubmitSpy).not.toHaveBeenCalled();
      component.find(FormModal).props().onSubmit(mockFormData);
      expect(handleLanguagePrefSubmitSpy).toHaveBeenCalledWith(mockFormData);
    });

    it("stores the user's selection in UserSettingsStore", () => {
      const component = shallow(<LanguagePreferenceFormModalComponent />);
      expect(UserSettingsStore.getKey(SAVED_STATE_KEY).language).toBe(
        defaultLanguage
      );
      component.find(FormModal).props().onSubmit(mockFormData);
      expect(UserSettingsStore.getKey(SAVED_STATE_KEY).language).toBe(
        newLanguage
      );
    });
  });

  describe("cancel", () => {
    it("sets isOpen to false", () => {
      const component = shallow(
        <LanguagePreferenceFormModalComponent isOpen={true} />
      );
      expect(component.state("isOpen")).toBe(true);
      component.find(FormModal).props().onClose();
      expect(component.state("isOpen")).toBe(false);
    });
  });
});
