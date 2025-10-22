import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Info, 
  Plus, 
  Minus,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Coverage, AddOnOption, AddOnSelection } from '@/lib/types';
import { formatCurrency } from '@/lib/constants';

interface AddOnSelectorProps {
  coverages: Coverage[];
  planId: number;
  sumInsured: number;
  basePremium: number;
  onSelectionChange: (selection: AddOnSelection) => void;
  initialSelection?: AddOnSelection;
}

const AddOnSelector: React.FC<AddOnSelectorProps> = ({
  coverages,
  planId,
  sumInsured,
  basePremium,
  onSelectionChange,
  initialSelection
}) => {
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, {
    isSelected: boolean;
    selectedVariant?: AddOnOption;
    amount: number;
  }>>({});
  const previousSelectionRef = useRef<AddOnSelection | null>(null);

  // Initialize selections
  useEffect(() => {
    if (initialSelection) {
      setSelectedAddOns(initialSelection.selectedAddOns);
    } else {
      // Initialize with default selections from coverages
      const defaultSelections: Record<string, {
        isSelected: boolean;
        selectedVariant?: AddOnOption;
        amount: number;
      }> = {};

      coverages.forEach(coverage => {
        if (coverage.internalName && coverage.amount !== null && coverage.amount !== undefined) {
          defaultSelections[coverage.internalName] = {
            isSelected: coverage.isSelected || false,
            selectedVariant: coverage.defaultSelected && coverage.value ? 
              (Array.isArray(coverage.value) ? coverage.value[0] : coverage.value) : undefined,
            amount: coverage.amount
          };
        }
      });

      setSelectedAddOns(defaultSelections);
    }
  }, [coverages, initialSelection]);

  // Calculate totals whenever selections change
  useEffect(() => {
    const totalAddOnAmount = Object.values(selectedAddOns).reduce((sum, addon) => {
      return sum + (addon.isSelected ? addon.amount : 0);
    }, 0);

    const totalPremium = basePremium + totalAddOnAmount;

    const selection: AddOnSelection = {
      planId,
      sumInsured,
      selectedAddOns,
      totalAddOnAmount,
      basePremium,
      totalPremium
    };

    // Only call onSelectionChange if there's actually a change
    if (JSON.stringify(previousSelectionRef.current) !== JSON.stringify(selection)) {
      previousSelectionRef.current = selection;
      onSelectionChange(selection);
    }
  }, [selectedAddOns, planId, sumInsured, basePremium]); // Remove onSelectionChange from dependencies

  const handleAddOnToggle = useCallback((internalName: string, isSelected: boolean) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [internalName]: {
        ...prev[internalName],
        isSelected
      }
    }));
  }, []);

  const handleVariantChange = useCallback((internalName: string, variant: AddOnOption) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [internalName]: {
        ...prev[internalName],
        selectedVariant: variant
      }
    }));
  }, []);

  const renderAddOnVariant = (coverage: Coverage) => {
    if (!coverage.value || !Array.isArray(coverage.value)) return null;

    const selectedVariant = selectedAddOns[coverage.internalName!]?.selectedVariant;
    
    return (
      <div className="mt-2">
        <Select
          value={selectedVariant?.internalName || ''}
          onValueChange={(value) => {
            const variant = coverage.value.find((v: AddOnOption) => v.internalName === value);
            if (variant) handleVariantChange(coverage.internalName!, variant);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {coverage.value.map((option: AddOnOption) => (
              <SelectItem key={option.internalName} value={option.internalName}>
                {option.label ? `${option.label}: ${option.displayName}` : option.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderAddOnCard = (coverage: Coverage) => {
    if (!coverage.internalName || !coverage.displayName) return null;

    const isSelected = selectedAddOns[coverage.internalName]?.isSelected || false;
    const amount = coverage.amount || 0;
    const hasVariants = coverage.value && Array.isArray(coverage.value) && coverage.value.length > 0;

    return (
      <Card key={coverage.internalName} className={`transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : 'hover:shadow-md'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Checkbox
                  id={`addon-${coverage.internalName}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleAddOnToggle(coverage.internalName!, checked as boolean)}
                  disabled={coverage.readOnly || !coverage.available}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`addon-${coverage.internalName}`}
                    className={`font-medium cursor-pointer ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                  >
                    {coverage.displayName}
                  </label>
                  {coverage.defaultMsg && (
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <Info className="h-3 w-3 mr-1" />
                      {coverage.defaultMsg}
                    </div>
                  )}
                </div>
              </div>

              {hasVariants && isSelected && renderAddOnVariant(coverage)}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  {coverage.available ? (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Available
                    </Badge>
                  )}
                  
                  {coverage.readOnly && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                {amount > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(amount)}
                    </span>
                    <p className="text-xs text-gray-500">per year</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalAddOnAmount = Object.values(selectedAddOns).reduce((sum, addon) => {
    return sum + (addon.isSelected ? addon.amount : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customize Your Coverage</h3>
          <p className="text-sm text-gray-600">Select add-ons to enhance your health insurance plan</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Base Premium</div>
          <div className="text-lg font-semibold">{formatCurrency(basePremium)}</div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3">
        {coverages
          .filter(coverage => coverage.internalName && coverage.displayName)
          .map(renderAddOnCard)}
      </div>

      {totalAddOnAmount > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Selected Add-ons</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  +{formatCurrency(totalAddOnAmount)}
                </div>
                <div className="text-xs text-green-700">Additional premium</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Total Premium</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(basePremium + totalAddOnAmount)}
              </div>
              <div className="text-sm text-blue-700">per year</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddOnSelector;
