import PropTypes from "prop-types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const StateSelector = ({
  states,
  description,
  showModal,
  pendingState,
  onPendingChange,
  onConfirm,
  selectedState,
  onChangeState,
}) => {
  return (
    <>
      {/* State Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5">
            <h2 className="text-xl font-semibold text-center">Select Your State</h2>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
            <Select value={pendingState} onValueChange={onPendingChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={onConfirm}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Selected state badge + change button */}
      {selectedState && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            State:{" "}
            <span className="font-semibold text-foreground">
              {states.find((s) => s.value === selectedState)?.label}
            </span>
          </span>
          <Button variant="outline" size="sm" onClick={onChangeState}>
            Change State
          </Button>
        </div>
      )}
    </>
  );
};

StateSelector.propTypes = {
  states: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      zipCode: PropTypes.string.isRequired,
      center: PropTypes.arrayOf(PropTypes.number).isRequired,
    })
  ).isRequired,
  description: PropTypes.string.isRequired,
  showModal: PropTypes.bool,
  pendingState: PropTypes.string.isRequired,
  onPendingChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  selectedState: PropTypes.string,
  onChangeState: PropTypes.func.isRequired,
};

export default StateSelector;
