# Password Input Component

A customizable password input component with strength indicator and validation for React applications.

## Features

- Password visibility toggle
- Real-time password strength indicator
- Customizable validation requirements
- Progress bar showing password strength
- Visual indicators for each requirement
- Fully responsive design
- Consistent with existing UI theme

## Usage

### Basic Usage

```jsx
import PasswordInput from '../Components/PasswordInput';

const MyForm = () => {
  const [password, setPassword] = useState('');

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <PasswordInput
      value={password}
      onChange={handlePasswordChange}
      name="password"
    />
  );
};
```

### With Custom Props

```jsx
<PasswordInput
  value={formFields.password}
  onChange={onChangeInput}
  name="password"
  label="Create Password"
  placeholder="Enter a strong password"
  disabled={isLoading}
  showStrengthIndicator={true}
  className="custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | - | Current password value |
| `onChange` | function | - | Change handler function |
| `name` | string | "password" | Input name attribute |
| `placeholder` | string | "Enter your password" | Input placeholder text |
| `disabled` | boolean | false | Whether input is disabled |
| `className` | string | "" | Additional CSS classes |
| `showStrengthIndicator` | boolean | true | Show/hide strength indicator |
| `label` | string | "Password" | Input label text |

## Password Requirements

The component validates the following requirements:

1. ✅ At least 8 characters
2. ✅ At least 1 number
3. ✅ At least 1 lowercase letter
4. ✅ At least 1 uppercase letter

## Strength Levels

- **Weak** (0-49%): Red indicator
- **Medium** (50-74%): Yellow indicator  
- **Good** (75-99%): Blue indicator
- **Strong** (100%): Green indicator

## Implementation Notes

- For login pages, set `showStrengthIndicator={false}` to hide validation
- For signup/registration, keep `showStrengthIndicator={true}` to help users create strong passwords
- The component maintains consistency with existing Material-UI styling
- Fully compatible with existing form validation logic

## Files Modified

- `admin/src/Components/PasswordInput/index.jsx` - New component
- `admin/src/Pages/Login/index.jsx` - Updated to use PasswordInput (no strength indicator)
- `admin/src/Pages/SignUp/index.jsx` - Updated to use PasswordInput (with strength indicator)
